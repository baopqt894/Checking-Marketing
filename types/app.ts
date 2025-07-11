export interface AppInfo {
  name: string
  appId: string
  platform: "ANDROID" | "IOS"
  appApprovalState: "APPROVED" | "ACTION_REQUIRED"
  manualAppInfo: {
    displayName: string
  }
  linkedAppInfo?: {
    appStoreId: string
    displayName: string
  }
  _id: string
 
}

export interface PublisherApp {
  _id: string
  app: AppInfo[]
  Publisher_id: string
  __v: number
  account_id:{
    _id:string;
    name:string;
    isLeader: boolean;
    email_company: string;
    email_private:string;
  }
}

export interface ProcessedApp {
  _id: string
  appId: string
  displayName: string
  platform: "ANDROID" | "IOS"
  approvalState: "APPROVED" | "ACTION_REQUIRED"
  publisherId: string
  linkedAppInfo?: {
    appStoreId: string
    displayName: string
  }
  account_id:{
    _id:string;
    name:string;
    isLeader: boolean;
    email_company: string;
    email_private:string;
  }
}
