import { SshClient } from './SshClient';
import { SshConfig } from '../../helpers/interfaces/ssh';
import { getNowTimestampSec } from '../../helpers/constants';

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

  public async purgeCache(): Promise<void> {
    await Promise.all(
      Object.values(this.connections).map(
        (el) => el.instance && el.instance.destroy(),
      ),
    );
  }
  public async getSSHInstance(config: SshConfig): Promise<SshClient> {
    const key = `${config.username}:${config.host}`;
    if (this.connections.hasOwnProperty(key)) {
      const isExpired =
        getNowTimestampSec() + this.EXPIRED_INTERVAL_MS >=
        this.connections[key].expire;
      if (isExpired) {
        this.connections[key] = {
          expire: getNowTimestampSec() + this.SSH_CACHE,
          instance: await new SshClient(config).waitConnection(),
        };
      }
    } else {
      this.connections[key] = {
        expire: getNowTimestampSec() + this.SSH_CACHE,
        instance: await new SshClient(config).waitConnection(),
      };
    }
    return this.connections[key].instance;
  }
}

export default new SshClientFactory();
