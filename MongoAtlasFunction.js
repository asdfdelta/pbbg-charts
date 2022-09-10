let whitelistMap;

exports = async function() {
    const dbValue = context.values.get("db_name");
    const activityValue = context.values.get("activity_collection");
    const chartValue = context.values.get("chart_collection");
    const chartValueTest = context.values.get("chart_collection_test");
    const remoteValue = context.values.get("remote_collection");
    const whitelistValue = context.values.get("whitelist_collection");
  
    const gameactivities = context.services.get("mongodb-atlas").db(dbValue).collection(activityValue);
    const gamecharts = context.services.get("mongodb-atlas").db(dbValue).collection(chartValue);
    const remoteHosts = context.services.get("mongodb-atlas").db(dbValue).collection(remoteValue);
    const whitelist = context.services.get("mongodb-atlas").db(dbValue).collection(whitelistValue);
    
    const remoteHostsConfig = await remoteHosts.find({}).toArray();
    const whitelistConfig = await whitelist.find({}).toArray();
    whitelistMap = whitelistConfig.map(e => e.origin);
    const totalCounts = await gameactivities.aggregate([
      {$group : { _id : '$origin', count : {$sum : 1}}}, 
      {$addFields: {'url': '$_id'}},
    ]).toArray();
    
    let toInsert = [];

    for (let i = 0; i < totalCounts.length; i++) {
      let count = totalCounts[i];
      if (checkWhitelist(count._id) > -1 && count.count > 0) {
        let doc = {
          origin: count._id,
          count: count.count,
          timestamp: new Date(),
          source: 'users'
        }
        toInsert.push(doc);
      }
    }
    
    for (let i = 0; i < remoteHostsConfig.length; i++) {
      let config = remoteHostsConfig[i];
      if (checkWhitelist(config.origin) > -1) {
        let response = await getRemoteHost(config.endpointUrl);
        if (response) {
          let userCount = response;
          for (let j = 0; j < config.usersProperty.length; j++) {
            userCount = returnProp(userCount, config.usersProperty[j]);
          }
          
          if (userCount > 0) {
            let doc = {
              origin: config.origin,
              count: userCount,
              timestamp: new Date(),
              source: 'api'
            }
            toInsert.push(doc);
          }
        }
      }
    }

    await gamecharts.insertMany(toInsert);
    
    await gameactivities.deleteMany({});
    
    return true;
};


async function getRemoteHost(resource) {
  const response = await context.http.get({ url: resource });
  if (response.statusCode != 200) {
    return false;
  }
  return EJSON.parse(response.body.text());
}

function returnProp(obj, prop) {
  return obj[prop];
}

function checkWhitelist(origin) {
  return whitelistMap.indexOf(origin);
}