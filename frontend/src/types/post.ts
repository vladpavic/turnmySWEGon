export interface PostImage {
  id: number;
  filename: string;
  thumbnail_filename: string | null;
  order: number;
}

export interface Post {
  id: number;
  username: string;
  text: string | null;
  hype: string | null;
  created_at: string;
  images: PostImage[];
}
