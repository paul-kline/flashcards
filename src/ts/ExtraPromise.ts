export default class ExtraPromise<T> {
  public pending: boolean = true;
  public isResolved: boolean = false;
  public isRejected: boolean = false;
  public result: Promise<T>;
  constructor(public promise: Promise<T>) {
    const me = this;
    this.result = new Promise((resolve, reject) => {
      promise
        .then(v => {
          me.pending = false;
          me.isResolved = true;
          resolve(v);
        })
        .catch(e => {
          me.pending = false;
          me.isRejected = true;
          reject(e);
        });
    });
  }
  async timeout(milliseconds: number, errorMessage: string = "Timeout occurred."): Promise<string | T> {
    if (!this.pending) {
      return this.result;
    } else {
      //pending...
      const _p: Promise<string> = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(errorMessage);
        }, milliseconds);
      });
      return Promise.race([this.result, _p]);
    }
  }
}
