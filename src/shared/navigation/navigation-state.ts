import { getFirstKey } from './utils';
import { EventEmitter } from '@/shared/lib/event-emitter';

type History<Tab extends string, Link extends string> = {
  [Property in Tab]: {
    pos: number;
    stack: Link[];
  }
};

type DefaultTabLinks<Tab extends string, Link extends string> = {
  [Property in Tab]: Link;
};

export type NavigationStateEvnetPayload = { tab: string; link: string };

export type NavigationStateEvents = {
  'history:push': NavigationStateEvnetPayload;
  'history:replace': NavigationStateEvnetPayload;
  'history:back': NavigationStateEvnetPayload;
  'history:forward': NavigationStateEvnetPayload;
  'history:goTo': NavigationStateEvnetPayload;
  'history:switchTab': NavigationStateEvnetPayload;
  'history:change': NavigationStateEvnetPayload;
};

export class NavigationState<Tab extends string, Link extends string = string> extends EventEmitter<NavigationStateEvents> {
  protected activeTab: Tab;
  protected history: History<Tab, Link>;
  protected defaultTabLinks: DefaultTabLinks<Tab, Link>;

  get currentTab() {
    return this.activeTab;
  }

  get currentLink() {
    const hist = this.history[this.activeTab];
    return hist.stack[hist.pos];
  }

  get currentPos() {
    return this.history[this.activeTab].pos;
  }

  constructor({
    reset,
    defaulTabLinks,
    activeTab,
  }: {reset?: boolean, defaulTabLinks: DefaultTabLinks<Tab, Link>, activeTab?: Tab}) {
    super();
    if (!reset) {
      this.on('history:change', () => {
        window?.sessionStorage.setItem('NavigationState', JSON.stringify({
          history: this.history,
          defaulTabLinks: this.defaultTabLinks,
          activeTab: this.activeTab
        }))
      });

      const state = window?.sessionStorage.getItem('NavigationState');

      if (state) {
        try {
          const paresedState = JSON.parse(state);
          this.history = paresedState.history;
          this.defaultTabLinks = paresedState.defaulTabLinks;
          this.activeTab = paresedState.activeTab;
          return;
        
        } catch {
          window?.sessionStorage.removeItem('NavigationState');
        }
      }
    }

    const hist: Partial<History<Tab, Link>> = {};

    for (const [tabName, defaultLink] of Object.entries<Link>(defaulTabLinks)) {
      hist[tabName as Tab] = {
        pos: 0,
        stack: [defaultLink],
      };
    }

    this.history = hist as History<Tab, Link>;
    this.defaultTabLinks = defaulTabLinks;
    this.activeTab = activeTab ?? getFirstKey(defaulTabLinks) as Tab;
  }

  push(link: Link, {tab, reset}: { tab?: Tab, reset?: boolean } = {}) {
    let tabChanged = false;

    if (tab && tab !== this.activeTab) {
      this._switchTab(tab);
      tabChanged = true;
    }

    if (reset) {
      this._reset();
    }

    const hist = this.history[this.activeTab];

    if (link !== hist.stack[hist.pos]) {
      hist.stack.length = hist.pos + 1;
      hist.stack.push(link);
      hist.pos++;
    }

    if (tabChanged) {
      this.emit('history:switchTab', { tab: this.activeTab, link: this.currentLink });
    }

    this.emit('history:push', { tab: this.activeTab, link: this.currentLink });
    this.emit('history:change', { tab: this.activeTab, link: this.currentLink });
  }

  replace(link: Link) {
    const hist = this.history[this.activeTab];
    hist.stack[hist.pos] = link;
    this.emit('history:replace', { tab: this.activeTab, link });
    this.emit('history:change', { tab: this.activeTab, link });
  }
  
  back() {
    const hist = this.history[this.activeTab];
    if (hist.pos === 0) {
      return;
    }
    hist.pos--;
    this.emit('history:back', { tab: this.activeTab, link: this.currentLink });
    this.emit('history:change', { tab: this.activeTab, link: this.currentLink });
  }

  forward() {
    const hist = this.history[this.activeTab];
    if (hist.pos === hist.stack.length - 1) {
      return;
    }
    hist.pos++;
    this.emit('history:forward', { tab: this.activeTab, link: this.currentLink });
    this.emit('history:change', { tab: this.activeTab, link: this.currentLink });
  }

  goTo(pos: number) {
    const hist = this.history[this.activeTab];
    if (pos < 0 || pos >= hist.stack.length) {
      return;
    }
    hist.pos = pos;
    this.emit('history:goTo', { tab: this.activeTab, link: this.currentLink });
    this.emit('history:change', { tab: this.activeTab, link: this.currentLink });
  }

  switchTab(tab: Tab, reset?: boolean) {
    const prevTab = this.activeTab;

    this._switchTab(tab);

    if (reset || tab === prevTab) {
      this._reset();
    }

    this.emit('history:switchTab', { tab, link: this.currentLink });
    this.emit('history:change', { tab, link: this.currentLink });
  }

  private _switchTab(tab: Tab) {
    if (this.defaultTabLinks[tab] === undefined) {
      throw new Error(`Tab "${tab}" does not exist in navigation state`);
    }

    this.activeTab = tab;
  }

  private _reset() {
    const hist = this.history[this.activeTab];
    hist.stack = [this.defaultTabLinks[this.activeTab]];
    hist.pos = 0;
  }
}