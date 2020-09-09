import RouteLogger from '../../routes/route_logger';
import sendRequestError from '../../common/errors/utils';
import Logger from 'bunyan';

let logger = new RouteLogger('/rules');

async function getProjectRules(server, path) {
  var project = await server.rulesController.getRules(path);
  project.rules = {};
  for (let index = 0; index < project.directories.length; index++) {
   let user_element = project.directories[index];
   logger.info('user_element =' + user_element );
   let user = await server.rulesController.getRules(path + '/' + user_element);
   let user_rules = {};
   for (let j =0 ; j < user.rules.length; j++){
     let rule_element = user.rules[j];
     let rule_content = await server.rulesController.rule(path + '/' + user_element + '/' + rule_element);
     rule_content = await rule_content.get();
     user_rules[rule_element] = rule_content;
   }
   project.rules[user_element] = user_rules; 
 }
 return project;
 }

 async function getUserRules(server, path, userid) {
  var user = await server.rulesController.getRules(path);
  let user_rules = {};
  for (let j =0 ; j < user.rules.length; j++){
     let rule_element = user.rules[j];
     let rule_content = await server.rulesController.rule(path + '/' + rule_element);
     rule_content = await rule_content.get();
     user_rules[rule_element] = rule_content;
   }
   user.rules = {};
   user.rules[userid] = user_rules; 
 return user;
 }

export default function rulesHandler(request, response) {
  /**
   * @type {ElastalertServer}
   */
  let server = request.app.get('server');

  let user = request.get('user-id');
  let project = request.get('project');
  let userRole = request.get('user-role');

  if (userRole == 'system_admin' || userRole == 'tenant_admin' ){
    let path = project + '/';
    getProjectRules(server, path)
    .then(function (rules) {
      response.send(rules);
      logger.sendSuccessful();
    })
    .catch(function (error) {
      sendRequestError(error);
    });    
  } else {
    let path = project + '/' + user + '/';
    getUserRules(server, path, user)
    .then(function (rules) {
      response.send(rules);
      logger.sendSuccessful();
    })
    .catch(function (error) {
      sendRequestError(error);
    });   
  }

}
