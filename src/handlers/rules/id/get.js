import RouteLogger from '../../../routes/route_logger';
import {sendRequestError} from '../../../common/errors/utils';

let logger = new RouteLogger('/rules/:id');

export default function ruleGetHandler(request, response) {
  /**
   * @type {ElastalertServer}
   */
  let server = request.app.get('server');
  let user = request.get('user-id');
  let project = request.get('project');
  let userRole = request.get('user-role');
  let path = project+'/'+user+'/'+request.params.id
 

  if (user == undefined || project == undefined || userRole == undefined){
    response.send({});
  }
  else {
    server.rulesController.rule(path)
      .then(function (rule) {
        rule.get()
          .then(function (rule) {
            response.send(rule);
            logger.sendSuccessful();
          })
          .catch(function (error) {
            logger.sendFailed(error);
            sendRequestError(response, error);
          });
      })
      .catch(function (error) {
        logger.sendFailed(error);
        sendRequestError(response, error);
      });
  }
}
