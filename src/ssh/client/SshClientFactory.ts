import { SshClient, SshConfig } from './SshClient';

interface ConnectionList {
  [key: string]: {
    expire: number;
    instance: SshClient;
  };
}
class SshClientFactory {
  private readonly EXPIRED_INTERVAL_MS = 1000 * 60 * 5; // 5 min
  private readonly SSH_CACHE = 1000 * 60 * 60; // 60 min
  private readonly connections: ConnectionList = {};
  private getNowTimestamp(): number {
    return Math.round(new Date().getTime() / 1000);
  }
  public async getSSHInstance(config: SshConfig): Promise<SshClient> {
    const key = `${config.username}:${config.host}`;
    if (this.connections.hasOwnProperty(key)) {
      const isExpired =
        this.getNowTimestamp() + this.EXPIRED_INTERVAL_MS >=
        this.connections[key].expire;
      if (isExpired) {
        this.connections[key] = {
          expire: this.getNowTimestamp() + this.SSH_CACHE,
          instance: await new SshClient(config).waitConnection(),
        };
      }
    } else {
      this.connections[key] = {
        expire: this.getNowTimestamp() + this.SSH_CACHE,
        instance: await new SshClient(config).waitConnection(),
      };
    }
    return this.connections[key].instance;
  }
}

export default new SshClientFactory();
