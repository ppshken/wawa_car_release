export interface User {
  user_id: number;
  username: string;
  name: string;
  level_user_id: number;
  level_user_name?: string;
  user_image?: string;
  setting_car_release?: number;
  menu_permissions?: string | Record<string, boolean>;
  access_name?: string;
  phone_number_1?: string;
  phone_number_2?: string;
  phone_number_3?: string;
  location_now?: string;
  user_status?: string;
  created_at?: string;
}

export interface Access {
  access_id: number;
  access_name: string;
  created_at?: string;
}

export interface LevelUser {
  level_user_id: number;
  level_user_name: string;
  access_id: number;
  setting_car_release: number;
  menu_permissions?: string | Record<string, boolean>;
  created_at?: string;
}


export interface Car {
  car_id: number;
  license_plate: string;
  brand: string;
  model: string;
  sub_model?: string;
  year?: number;
  created_at?: string;
}

export interface Store {
  store_id: number;
  store_name: string;
  store_address?: string;
  telephone_number?: string;
  fax_number?: string;
  email?: string;
  url?: string;
  customer_delivery_time?: string;
  store_location?: string;
  created_at?: string;
}

export interface GroupStore {
  group_store_id: number;
  group_store_name: string;
  group_color?: string;
  created_at?: string;
}

export interface CarReleaseType {
  car_release_type_id: number;
  type: string;
  quantity?: number;
  created_at?: string;
}

export interface KeyHolder {
  key_holder_id: number;
  key_holder_name: string;
  created_at?: string;
}

export interface Parking {
  parking_id: number;
  parking_name: string;
  created_at?: string;
}

export interface Payment {
  payment_id: number;
  payment_name: string;
  created_at?: string;
}

export interface VisitType {
  visit_type_id: number;
  visit_type_name: string;
  created_at?: string;
}

export interface CarReleaseFollower {
  follower_id: number;
  car_release_id: number;
  follower_name: string;
  created_at?: string;
}

export interface ListStore {
  list_id: number;
  car_release_id: number;
  store_id: number;
  group_store_id?: number;
  row_order: number;
  sum_quantity: number;
  lat_long?: string;
  store_name_result?: string;
  bypass: number;
  off_site: number;
  position_product_id?: number;
  position_production_order?: number;
  position_product_name?: string;
  created_by?: number;
  created_at?: string;
  // Joined fields
  store_name?: string;
  store_address?: string;
  telephone_number?: string;
  customer_delivery_time?: string;
  store_location?: string;
  // Check-in details
  check_in_id?: number;
  image_check_in?: string;
  date_time_check_in?: string;
  signature?: string;
  check_in_location?: string;
  // Check-out details
  check_out_id?: number;
  payment_id?: number;
  payment_name?: string;
  image_bill?: string;
  date_time_check_out?: string;
  cash?: number;
  transfer?: number;
  transfer_according?: number;
  check_out_off_site?: number;
  paid?: number;
  amount?: number;
  visit_customer?: number;
  visit_type_id?: number;
  visit_type_name?: string;
  visit_note?: string;
  // Problem details
  problem_id?: number;
  problem_name?: string;
  normal_bill?: number;
  edit_bill?: number;
  product_swap?: number;
  out_of_stock?: number;
  overstock?: number;
}

export interface CheckIn {
  check_in_id: number;
  list_id: number;
  image_check_in?: string;
  date_time_check_in?: string;
  signature?: string;
  location?: string;
  created_at?: string;
}

export interface CheckOut {
  check_out_id: number;
  list_id: number;
  payment_id?: number;
  image_bill?: string;
  date_time_check_out?: string;
  cash: number;
  transfer: number;
  transfer_according: number;
  off_site: number;
  paid: number;
  amount: number;
  visit_customer: number;
  visit_type_id?: number;
  visit_type_name?: string;
  visit_note?: string;
  created_at?: string;
}

export interface Problem {
  problem_id: number;
  list_id: number;
  problem_name?: string;
  normal_bill: number;
  edit_bill: number;
  product_swap: number;
  out_of_stock: number;
  overstock: number;
  created_at?: string;
}

export interface CarReturn {
  car_return_id: number;
  car_release_id: number;
  key_holder_id?: number;
  key_holder_name?: string;
  parking_id?: number;
  parking_name?: string;
  mileage: number;
  image_mileage?: string;
  image_front?: string;
  image_around_1?: string;
  image_around_2?: string;
  image_around_3?: string;
  image_around_4?: string;
  image_return?: string;
  image_pda?: string;
  gas_bill?: number;
  note?: string;
  created_at?: string;
}

export interface CarRelease {
  car_release_id: number;
  car_release_no: string;
  car_id: number;
  license_plate?: string;
  brand?: string;
  model?: string;
  sub_model?: string;
  car_release_type_id?: number;
  car_release_type_name?: string;
  user_id: number;
  driver_name?: string;
  driver_phone?: string;
  group_store_id?: number;
  group_store_name?: string;
  group_color?: string;
  mileage?: number;
  image_mileage?: string;
  image_front?: string;
  image_around_1?: string;
  image_around_2?: string;
  image_around_3?: string;
  image_around_4?: string;
  image_around_5?: string;
  image_pda?: string;
  pda_device?: string;
  description?: string;
  total_number_of_bills?: number;
  total_amount?: number;
  accounting_status?: string;
  accounting_note?: string;
  created_at?: string;
  total_stores?: number;
  completed_stores?: number;
  store_count?: number;
  is_returned?: boolean;
  followers?: CarReleaseFollower[];
  stores?: ListStore[];
  car_return?: CarReturn | null;
}

export interface DashboardSummary {
  total_releases_today: number;
  total_cash: number;
  total_transfer_received: number;
  pending_transfer_amount: number;
  pending_transfer_count: number;
  grand_total_amount: number;
  off_site_count: number;
  problem_count: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
  data?: T;
  [key: string]: any;
}
