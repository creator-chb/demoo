import http from 'http';
declare function initWebSocket(server: http.Server): void;
declare function notifyNewOrder(orderData: any): void;
declare function notifyOrderUpdate(orderData: any): void;
declare function notifyCustomerOrderUpdate(userOpenid: string, orderData: any): void;
export { initWebSocket, notifyNewOrder, notifyOrderUpdate, notifyCustomerOrderUpdate };
//# sourceMappingURL=index.d.ts.map