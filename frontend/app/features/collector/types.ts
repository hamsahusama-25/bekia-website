export type Me = {
  isApprovedByAdmin: boolean;
  documentsComplete?: boolean;
};

export type Stop = {
  pickupId: string;
  companyName: string;
  address: string;
  timeSlot: string;
  distanceMeters: number;
};

export type Progress = {
  completedCompaniesThisMonth: number;
  monthlyCompanyTarget: number;
};

export type RouteData = {
  progress: Progress;
  stops: Stop[];
}