import express from 'express';
import bodyParser from 'body-parser';
import _debug from 'debug';
import human2date from 'date.js';
import { formatDate } from './utils';
import * as db from './db';
import * as slack from './slack';
import config from '../config.json';


const debug = _debug('pledge');

async function newPledge({ text, requester }) {
  const [, performer, content, humanReadableDeadline] = /(@[a-zA-Z0-9]+) (.+) by (.+)/.exec(text.trim()) || [];

  if (!performer) {
    throw new Error('"Username" is missing. (@username [what] by [when])');
  } else if (!content) {
    throw new Error('"What" is missing. (@username [what] by [when])');
  } else if (!humanReadableDeadline) {
    throw new Error('"When" is missing. (@username [what] by [when])');
  }

  const deadline = human2date(humanReadableDeadline);

  if (deadline.getTime() < Date.now()) {
    throw new Error('"When" should be in the future');
  }

  await db.insertPledge({ requester, performer, content, deadline }).then(debug);

  await slack.postOnSlack({
    text: `${requester} asked you to "${content}" by ${humanReadableDeadline} (${formatDate(deadline)})`,
    channel: performer
  });

  return `You asked ${performer} to "${content}" by ${humanReadableDeadline} (${formatDate(deadline)})`;
}

async function getPledgesList(requester) {
  const { requests, pledges } = await db.getList(requester);

  const baseURL = config.site_url;

  const myPledges = `*My pledges:*\n${pledges.map(p => `\n • ${p.content} _for ${p.requester}_ *by ${p.deadline}* <${baseURL}/deletePledge/${p.id}|delete> <${baseURL}/completePledge/${p.id}|complete>`)}`;
  const myRequests = `*My requests:*\n${requests.map(p => `\n • _${p.performer}_ pledged to ${p.content} *by ${p.deadline}* <${baseURL}/deletePledge/${p.id}|delete> <${baseURL}/completePledge/${p.id}|complete>`)}`;

  return `${myPledges}\n\n${myRequests}`;
}

export async function findNewNotifications() {
  // notify for pledges that have expired
  const expiredPledges = await db.findAllPledgesExpiredToNotify();
  expiredPledges.map(async p => {
    await slack.postOnSlackMultipleChannels({
      text: `pledge ${p.content} expired just now`
    }, [p.requester, p.performer]);
    await db.setExpiredNotificationAsSentOnPledge(p.id);
  });
}

setInterval(findNewNotifications, 60 * 1000);

// EXPRESS SERVER

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));

router.post('/slackCommand', async ({ body: { text, user_name } }, res) => {
  debug({ text, user_name });
  const requester = `@${user_name}`;

  if (typeof text === 'undefined' || typeof user_name === 'undefined') {
    return res.status(422).send('command does not respect Slack POST format');
  }

  try {
    switch (text.trim()) {
      case 'list':
        return res.send(await getPledgesList(requester));
      default:
        return res.send(await newPledge({ text, requester }));
    }
  } catch (err) {
    debug(err);
    return res.send(`Error: ${err.message}`);
  }
});

router.get('/deletePledge/:pledgeId', async ({ params: { pledgeId } }, res) => {
  try {
    const { requester, performer, content } = await db.getPledge(pledgeId);
    await db.deletePledge(pledgeId);
    // notify on slack
    const notificationMessage = `pledge "${content}" has been deleted`;
    await slack.postOnSlackMultipleChannels({
      text: notificationMessage
    }, [requester, performer]);
    return res.send(`Successfully deleted pledge #${pledgeId}`);
  } catch (e) {
    return res.send(`Error: ${e.message}`);
  }
});

router.get('/completePledge/:pledgeId', async ({ params: { pledgeId } }, res) => {
  try {
    const { requester, performer, content } = await db.getPledge(pledgeId);
    await db.completePledge(pledgeId);
    // notify on slack
    const notificationMessage = `pledge "${content}" has been completed !!!`;
    await slack.postOnSlackMultipleChannels({
      text: notificationMessage
    }, [requester, performer]);
    return res.send(`Successfully completed pledge #${pledgeId}`);
  } catch (e) {
    return res.send(`Error: ${e.message}`);
  }
});

export default router;
