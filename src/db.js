import db from './models';
import config from '../config.json';
import { formatDate } from './utils';


export const getList = async requester => {
  const requests = await (db.Pledges.findAll({
    where: {
      completed: false,
      requester: requester
    },
    raw: true
  })).map(x => ({ ...x, deadline: formatDate(Date(x.deadline)) }));

  const pledges = await (db.Pledges.findAll({
    where: {
      completed: false,
      performer: requester
    },
    raw: true
  })).map(x => ({ ...x, deadline: formatDate(Date(x.deadline)) }));

  return { requests, pledges };
};

export const getPledge = (pledgeId) => {
  return db.Pledges.findById(pledgeId);
};

export const insertPledge = ({ requester, performer, content, deadline }) => {
  return db.Pledges.create({
    requester: requester,
    performer: performer,
    content: content,
    deadline: deadline
  });
};

export const findAllPledgesExpiredToNotify = () => {
  return db.Pledges.findAll({
    where: {
      expiredNotificationSent: false,
      completed: false,
      deadline: {
        [db.Sequelize.Op.lt]: Date.now()
      }
    }
  });
};

export const setExpiredNotificationAsSentOnPledge = pledgeId => {
  return db.Pledges.update(
    { expiredNotificationSent: true },
    { where: { id: pledgeId } }
  );
};

export const deletePledge = pledgeId => {
  return db.Pledges.destroy({ where: { id: pledgeId }});
};

export const completePledge = pledgeId => {
  return db.Pledges.update(
    { completed: true },
    { where: { id: pledgeId } }
  );
};
