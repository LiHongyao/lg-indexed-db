/*
 * @Author: Lee
 * @Date: 2021-12-19 14:09:02
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-19 15:10:56
 */
/*
 * @Author: Lee
 * @Date: 2021-12-19 13:31:58
 * @LastEditors: Lee
 * @LastEditTime: 2021-12-19 14:04:12
 */

export interface IDBIndexProps {
  name: string;
  keyPath: string | Array<string>;
  options?: IDBIndexParameters;
}
export interface IDBObjectStoreProps {
  name: string;
  options: IDBObjectStoreParameters;
  indexs: IDBIndexProps[];
}
class DB_Instance {
  private __DATABASE_NAME: string = '';
  private __VERSION: number = 0;
  private __DB: IDBDatabase | null = null;
  // 构造单例
  private static instance: DB_Instance;
  private constructor() {}
  static defaultIndexedDB() {
    if (!DB_Instance.instance) {
      DB_Instance.instance = new DB_Instance();
    }
    return DB_Instance.instance;
  }

  /**
   * 注册数据库
   * @param databaseName 数据库名
   * @param version 数据库版本
   */
  public install(databaseName: string, objectStores: IDBObjectStoreProps[], version: number = 1) {
    this.__DATABASE_NAME = databaseName;
    this.__VERSION = version;
    const DBOpenRequest = window.indexedDB.open(databaseName, version);
    DBOpenRequest.onerror = () => {
      console.log('IndexedDB：Open fail...');
    };
    DBOpenRequest.onsuccess = () => {
      console.log('IndexedDB：Open success...');
      this.__DB = DBOpenRequest.result;
    };
    // 数据库升级事件，如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件
    DBOpenRequest.onupgradeneeded = (e: any) => {
      console.log('IndexedDB：Upgrading...');
      this.__DB = e.target.result as IDBDatabase;
      // 遍历配置数据仓库
      objectStores.forEach(({ name, options, indexs }) => {
        // 如果不存在则新建数据仓库
        if (!this.__DB?.objectStoreNames.contains(name)) {
          let objStore = this.__DB?.createObjectStore(name, options);
          indexs.forEach(({ name, keyPath, options }) => {
            objStore?.createIndex(name, keyPath, options);
          });
        }
      });
    };
  }
  /**
   * 插入数据
   * @param storeName
   * @param record
   * @returns
   */
  public insert<T>(storeName: string, record: T) {
    return new Promise((resolve, reject) => {
      if (this.__DB) {
        const request = this.__DB.transaction([storeName], 'readwrite').objectStore(storeName).add(record);
        request.onsuccess = () => {
          resolve(null);
        };
        request.onerror = (e) => {
          console.log(e);
          reject(e);
        };
      } else {
        reject();
      }
    });
  }
}

const IndexedDB = DB_Instance.defaultIndexedDB();
export default IndexedDB;
