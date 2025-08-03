declare namespace chrome {
  namespace storage {
    namespace local {
      function get(keys?: string[] | string | null): Promise<{ [key: string]: any }>;
      function set(items: { [key: string]: any }): Promise<void>;
    }
  }
  
  namespace runtime {
    function getURL(path: string): string;
    function sendMessage(message: any): Promise<any>;
  }
  
  namespace tabs {
    function query(queryInfo: { active?: boolean; currentWindow?: boolean }): Promise<{ id?: number }[]>;
    function sendMessage(tabId: number, message: any): Promise<any>;
  }
}