export interface TDXQuote {
  header: {
    version: number;
    ak_type: string;
    tee_type: string;
    qe_vendor: string;
    user_data: string;
  };
  cert_data: string;
  body: {
    tee_tcb_svn: string;
    mrseam: string;
    mrsignerseam: string;
    seamattributes: string;
    tdattributes: string;
    xfam: string;
    mrtd: string;
    mrconfig: string;
    mrowner: string;
    mrownerconfig: string;
    rtmr0: string;
    rtmr1: string;
    rtmr2: string;
    rtmr3: string;
    reportdata: string;
  };
  verified: boolean;
  checksum: string;
  can_download: boolean;
  uploaded_at: string;
}
