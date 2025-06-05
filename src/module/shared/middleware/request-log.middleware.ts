import { logger } from "./logger";
export const requestLogger = (req, res, next) => {
    const start = Date.now();
  
    // Log request
    logger.info(`[REQUEST] ${req.method} ${req.originalUrl}`);
    logger.debug(`Request body: ${JSON.stringify(req.body)}`);
    logger.debug(`Request query: ${JSON.stringify(req.query)}`);
    logger.debug(`Request params: ${JSON.stringify(req.params)}`);
  
    // Capture response body
    const oldSend = res.send;
    res.send = function (body) {
      const duration = Date.now() - start;
      logger.debug(`Response body: ${body}`);
      logger.info(`[RESPONSE] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
      oldSend.call(this, body);
    };
  
    next();
  };
  
