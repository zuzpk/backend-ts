import { PubSub } from "@zuzjs/core"
import { ICacheSection, User } from "./lib/types";
export const pubsub = new PubSub()


class CacheSection<T> implements ICacheSection<T> {

  private data: Record<string, T> = {};

  constructor(private keySelector: (item: T) => string) {}

  public getAll(): T[] {
    return Object.values(this.data);
  }

  public getById(name: string): T | null {
    return this.data[name] ?? null;
  }

  public update(item: T): void {
    const key = this.keySelector(item);
    if (!this.data[key]) {
      this.data[key] = item;
    } else {
      this.data[key] = { ...this.data[key], ...item };
    }
  }

  public add(item: T): void {
    const key = this.keySelector(item);
    if (!this.data[key]) {
      this.data[key] = item;
    } else {
      this.data[key] = { ...this.data[key], ...item };
    }
  }

  public addAll(items: T[]): void {
    items.forEach((item) => this.add(item));
  }

  public remove(name: string): void {
    delete this.data[name];
  }

  public clear(): void {
    this.data = {};
  }
}

export class ZuzCache {
  private static instance: ZuzCache;

  public readonly users: ICacheSection<User>;
  
  private constructor() {
    this.users = new CacheSection<User>((app) => app.ID);
  }

  public static getInstance(): ZuzCache {
    if (!ZuzCache.instance) {
      ZuzCache.instance = new ZuzCache();
    }
    return ZuzCache.instance;
  }

  public clearAll(): void {
    this.users.clear();
    console.log("Global cache cleared.");
  }
}

export default ZuzCache.getInstance()