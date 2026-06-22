import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { PostFromRPC, Profile } from '../types';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import TextField from '../components/ui/TextField';
import PostCard from '../components/post/PostCard';
import CreatePostBox from '../components/post/CreatePostBox';
import PostComposer from '../components/post/PostComposer';
import DeleteConfirm from '../components/post/DeleteConfirm';
import { LocationIcon } from '../components/ui/icons';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/auth-context';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=1200&q=60';

function fallbackAvatar(name: string | null) {
  const n = encodeURIComponent(name ?? 'U');
  return `https://ui-avatars.com/api/?name=${n}&background=321847&color=fff&size=200`;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold text-brand">{value.toLocaleString()}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

interface EditForm {
  full_name: string;
  username: string;
  bio: string;
  location: string;
}

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [following, setFollowing] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<PostFromRPC | null>(null);
  const [deletingPost, setDeletingPost] = useState<PostFromRPC | null>(null);
  const [userPosts, setUserPosts] = useState<PostFromRPC[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setCoverUploading(true);
    const filePath = `covers/${id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('meet_images')
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast.error(uploadError.message);
      setCoverUploading(false);
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('meet_images').getPublicUrl(filePath);
    await supabase
      .from('profiles')
      .update({ cover_url: publicUrl })
      .eq('id', id);
    setProfile((p) => (p ? { ...p, cover_url: publicUrl } : p));
    toast.success('Cover photo updated');
    setCoverUploading(false);
    e.target.value = '';
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    full_name: '',
    username: '',
    bio: '',
    location: '',
  });
  const [saving, setSaving] = useState(false);

  const isMe = session?.user.id === id;

  const fetchUserPosts = useCallback(async () => {
    if (!id) return;
    setPostsLoading(true);
    const [postsRes, likesRes] = await Promise.all([
      supabase
        .from('posts')
        .select(
          `*, author:profiles!posts_author_id_fkey(id, full_name, username, avatar_url),
          like_count:likes(count), comment_count:comments(count)`,
        )
        .eq('author_id', id)
        .order('created_at', { ascending: false }),
      session?.user.id
        ? supabase
            .from('likes')
            .select('post_id')
            .eq('user_id', session.user.id)
        : Promise.resolve({ data: [] as { post_id: string }[], error: null }),
    ]);
    if (postsRes.error) console.error(postsRes.error);
    const myLikedIds = new Set((likesRes.data ?? []).map((l) => l.post_id));
    const mapped: PostFromRPC[] = (postsRes.data ?? []).map((post) => ({
      ...post,
      like_count:
        (post.like_count as unknown as { count: number }[])[0]?.count ?? 0,
      comment_count:
        (post.comment_count as unknown as { count: number }[])[0]?.count ?? 0,
      liked_by_me: myLikedIds.has(post.id),
    }));
    setUserPosts(mapped);
    setPostsLoading(false);
  }, [id, session]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      if (cancelled) return;
      if (error) console.error(error);
      if (data) setProfile(data as Profile);
      setLoading(false);
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    fetchUserPosts(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [fetchUserPosts]);

  const openEditModal = () => {
    setEditForm({
      full_name: profile?.full_name ?? '',
      username: profile?.username ?? '',
      bio: profile?.bio ?? '',
      location: profile?.location ?? '',
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name || null,
        username: editForm.username || null,
        bio: editForm.bio || null,
        location: editForm.location || null,
      })
      .eq('id', id)
      .select()
      .single();

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProfile(data as Profile);
    setEditOpen(false);
    toast.success('Profile updated');
  };

  const displayName = profile?.full_name ?? profile?.username ?? 'User';

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-brand">Profile not found.</p>
        <Link to="/users" className="mt-2 inline-block text-sm text-accent">
          Browse people
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="relative h-44 w-full sm:h-56">
          <img
            src={profile.cover_url ?? FALLBACK_COVER}
            alt=""
            className="h-full w-full object-cover"
          />
          {isMe && (
            <>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <button
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-60"
              >
                {coverUploading ? (
                  'Uploading…'
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Change cover
                  </>
                )}
              </button>
            </>
          )}
        </div>

        <div className="px-4 pb-4 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                src={profile.avatar_url ?? fallbackAvatar(displayName)}
                alt={displayName}
                size={96}
                ring
              />
              <div className="pb-1">
                <h1 className="text-xl font-bold text-brand">{displayName}</h1>
                {profile.username && (
                  <p className="text-sm text-muted">@{profile.username}</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 pb-1">
              {isMe ? (
                <Button variant="outline" size="sm" onClick={openEditModal}>
                  Edit profile
                </Button>
              ) : (
                <>
                  <Button
                    variant={following ? 'outline' : 'accent'}
                    size="sm"
                    onClick={() => setFollowing((v) => !v)}
                  >
                    {following ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="outline" size="sm">
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 max-w-xl text-sm text-brand-900">
              {profile.bio}
            </p>
          )}

          {profile.location && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
              <LocationIcon /> {profile.location}
            </p>
          )}

          <div className="mt-4 flex gap-8 border-t border-line pt-4">
            <Stat label="Posts" value={userPosts.length ?? 0} />
            <Stat label="Followers" value={0} />
            <Stat label="Following" value={0} />
          </div>
        </div>
      </div>

      {isMe && <CreatePostBox onOpen={() => setComposerOpen(true)} />}

      {postsLoading ? (
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          Loading posts…
        </div>
      ) : userPosts.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-muted shadow-sm">
          {displayName.split(' ')[0]} hasn't posted anything yet.
        </div>
      ) : (
        userPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            canManage={isMe}
            onEdit={(p) => {
              setEditingPost(p);
              setComposerOpen(true);
            }}
            onDelete={setDeletingPost}
            onRefetchPosts={fetchUserPosts}
          />
        ))
      )}

      <PostComposer
        open={composerOpen}
        onClose={() => {
          setComposerOpen(false);
          setEditingPost(null);
        }}
        editingPost={editingPost}
        refetchPosts={fetchUserPosts}
      />
      <DeleteConfirm
        open={Boolean(deletingPost)}
        onClose={() => setDeletingPost(null)}
        onConfirm={() => setDeletingPost(null)}
      />

      {/* Edit profile modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <TextField
            label="Full name"
            type="text"
            placeholder="Your full name"
            value={editForm.full_name}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, full_name: e.target.value }))
            }
          />
          <TextField
            label="Username"
            type="text"
            placeholder="username"
            value={editForm.username}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, username: e.target.value }))
            }
          />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-brand">
              Bio
            </label>
            <textarea
              rows={3}
              placeholder="Tell people about yourself"
              value={editForm.bio}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, bio: e.target.value }))
              }
              className="w-full resize-none rounded-xl border border-line bg-canvas px-4 py-2.5 text-sm text-brand placeholder:text-muted focus:border-brand-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <TextField
            label="Location"
            type="text"
            placeholder="City, Country"
            value={editForm.location}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, location: e.target.value }))
            }
          />
        </div>
      </Modal>
    </div>
  );
}
