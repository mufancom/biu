import {SocketIOService} from './services/socket-io-service';
import {TaskService} from './services/task-service';

export const socketIOService = new SocketIOService();

export const taskService = new TaskService(socketIOService);
