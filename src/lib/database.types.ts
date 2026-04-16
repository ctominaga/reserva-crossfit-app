export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'athlete' | 'coach' | 'admin';
export type PlanStatus = 'active' | 'inactive' | 'overdue';
export type ClassType = 'WOD' | 'Weightlifting' | 'Endurance' | 'Open Box';
export type MovementLevel = 'rx' | 'scaled' | 'beginner';
export type WODType = 'AMRAP' | 'For Time' | 'EMOM' | 'Chipper' | 'Strength';
export type BookingStatus = 'confirmed' | 'cancelled' | 'attended';
export type PRCategory =
  | 'barbell'
  | 'endurance'
  | 'gymnastics'
  | 'wod_girls'
  | 'wod_heroes'
  | 'wod_open'
  | 'wod_notable';
export type PostType = 'text' | 'image' | 'achievement' | 'announcement';
export type CoachSpecialty =
  | 'WOD'
  | 'Weightlifting'
  | 'Endurance'
  | 'Gymnastics'
  | 'Nutrition';

export interface ProfileRow {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_color: string;
  member_since: string;
  instagram: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanRow {
  id: string;
  name: string;
  price_monthly: number;
  features: string[];
  is_highlighted: boolean;
  is_active: boolean;
  created_at: string;
}

export interface AthletePlanRow {
  id: string;
  athlete_id: string;
  plan_id: string;
  status: PlanStatus;
  started_at: string;
  expires_at: string;
  created_at: string;
}

export interface CoachRow {
  id: string;
  profile_id: string;
  specialties: CoachSpecialty[];
  bio: string;
  certifications: string[];
  active_since: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassSessionRow {
  id: string;
  date: string;
  time: string;
  class_type: ClassType;
  coach_id: string | null;
  capacity: number;
  is_cancelled: boolean;
  created_at: string;
}

export interface BookingRow {
  id: string;
  session_id: string;
  athlete_id: string;
  status: BookingStatus;
  checked_in_at: string | null;
  created_at: string;
}

export interface WODRow {
  id: string;
  date: string;
  type: WODType;
  title: string;
  duration_minutes: number | null;
  warmup: string[];
  movements: Json;
  scaling_rx: string;
  scaling_scaled: string;
  scaling_beginner: string;
  cooldown: string[];
  published_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AthleteResultRow {
  id: string;
  athlete_id: string;
  wod_id: string;
  session_id: string;
  level: MovementLevel;
  result_value: string;
  movement_results: Json;
  notes: string | null;
  recorded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalRecordRow {
  id: string;
  athlete_id: string;
  movement: string;
  value: string;
  unit: string;
  category: PRCategory;
  icon: string;
  achieved_at: string;
  created_at: string;
}

export interface PostRow {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  type: PostType;
  tags: string[];
  likes_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostLikeRow {
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface PostCommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface ScheduleOverrideRow {
  id: string;
  key: string;
  slots: Json;
  created_by: string | null;
  created_at: string;
}

type WithOptionals<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface TableBase<Row, Insert, Update> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export interface Database {
  public: {
    Tables: {
      profiles: TableBase<
        ProfileRow,
        WithOptionals<ProfileRow, 'created_at' | 'updated_at' | 'instagram' | 'avatar_color' | 'member_since' | 'role'>,
        Partial<ProfileRow>
      >;
      plans: TableBase<
        PlanRow,
        WithOptionals<PlanRow, 'id' | 'created_at' | 'is_highlighted' | 'is_active' | 'features'>,
        Partial<PlanRow>
      >;
      athlete_plans: TableBase<
        AthletePlanRow,
        WithOptionals<AthletePlanRow, 'id' | 'created_at' | 'status'>,
        Partial<AthletePlanRow>
      >;
      coaches: TableBase<
        CoachRow,
        WithOptionals<CoachRow, 'id' | 'created_at' | 'updated_at' | 'specialties' | 'bio' | 'certifications' | 'is_active'>,
        Partial<CoachRow>
      >;
      class_sessions: TableBase<
        ClassSessionRow,
        WithOptionals<ClassSessionRow, 'id' | 'created_at' | 'capacity' | 'is_cancelled' | 'coach_id'>,
        Partial<ClassSessionRow>
      >;
      bookings: TableBase<
        BookingRow,
        WithOptionals<BookingRow, 'id' | 'created_at' | 'status' | 'checked_in_at'>,
        Partial<BookingRow>
      >;
      wods: TableBase<
        WODRow,
        WithOptionals<WODRow, 'id' | 'created_at' | 'updated_at' | 'warmup' | 'movements' | 'scaling_rx' | 'scaling_scaled' | 'scaling_beginner' | 'cooldown' | 'published_by' | 'duration_minutes'>,
        Partial<WODRow>
      >;
      athlete_results: TableBase<
        AthleteResultRow,
        WithOptionals<AthleteResultRow, 'id' | 'created_at' | 'updated_at' | 'movement_results' | 'notes' | 'recorded_by'>,
        Partial<AthleteResultRow>
      >;
      personal_records: TableBase<
        PersonalRecordRow,
        WithOptionals<PersonalRecordRow, 'id' | 'created_at' | 'icon'>,
        Partial<PersonalRecordRow>
      >;
      posts: TableBase<
        PostRow,
        WithOptionals<PostRow, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'tags' | 'image_url' | 'type'>,
        Partial<PostRow>
      >;
      post_likes: TableBase<
        PostLikeRow,
        WithOptionals<PostLikeRow, 'created_at'>,
        Partial<PostLikeRow>
      >;
      post_comments: TableBase<
        PostCommentRow,
        WithOptionals<PostCommentRow, 'id' | 'created_at'>,
        Partial<PostCommentRow>
      >;
      schedule_overrides: TableBase<
        ScheduleOverrideRow,
        WithOptionals<ScheduleOverrideRow, 'id' | 'created_at' | 'created_by'>,
        Partial<ScheduleOverrideRow>
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
