import React from 'react';
import { Subscription } from '@/lib/supabase/supabase.types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import CypressProfileIcon from '../icons/profileIcon';
import { LogOut } from 'lucide-react';
import LogoutButton from '../global/logout-button';
import { createClient } from '@/utils/supabase/server';
import { findUser } from '@/lib/supabase/queries';

interface UserCardProps {
  subscription: Subscription | null;
}

const UserCard: React.FC<UserCardProps> = async ({ subscription }) => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  const response = await findUser(user.id);
  let avatarPath;
  if (!response) return;
  if (!response.avatarUrl) avatarPath = '';
  else {
    avatarPath = supabase.storage
      .from('avatars')
      .getPublicUrl(response.avatarUrl)?.data.publicUrl;
  }
  const profile = {
    ...response,
    avatarUrl: avatarPath,
  };

  return (
    <article
      className="hidden
      sm:flex 
      justify-between 
      items-center 
      px-4 
      py-2 
      dark:bg-Neutrals/neutrals-12
      rounded-3xl
  "
    >
      <aside className="flex justify-center items-center gap-2">
        <Avatar>
          <AvatarImage src={profile.avatarUrl} />
          <AvatarFallback>
            <CypressProfileIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <small
            className="w-[100px] 
          overflow-hidden 
          overflow-ellipsis
          "
          >
            {profile.email}
          </small>
        </div>
      </aside>
      <div className="flex items-center justify-center">
        <LogoutButton>
          <LogOut />
        </LogoutButton>
      </div>
    </article>
  );
};

export default UserCard;
