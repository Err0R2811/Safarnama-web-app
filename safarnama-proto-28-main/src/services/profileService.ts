import { supabase } from '../lib/supabase';

export interface UserProfile {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  address?: string;
  bio?: string;
  profile_picture_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  phone?: string;
  address?: string;
  bio?: string;
  profile_picture_url?: string;
}

export const profileService = {
  // Get user profile
  async getProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile not found - this is normal for new users
        return null;
      }
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  },

  // Create a new profile
  async createProfile(profileData: UserProfileUpdate): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        first_name: profileData.first_name || null,
        last_name: profileData.last_name || null,
        date_of_birth: profileData.date_of_birth || null,
        phone: profileData.phone || null,
        address: profileData.address || null,
        bio: profileData.bio || null,
        profile_picture_url: profileData.profile_picture_url || null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    return data;
  },

  // Update user profile
  async updateProfile(profileData: UserProfileUpdate): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // First, check if profile exists
    const existingProfile = await this.getProfile();
    
    if (!existingProfile) {
      // Create new profile if it doesn't exist
      return this.createProfile(profileData);
    }

    // Update existing profile
    const updateData: any = {};
    if (profileData.first_name !== undefined) updateData.first_name = profileData.first_name;
    if (profileData.last_name !== undefined) updateData.last_name = profileData.last_name;
    if (profileData.date_of_birth !== undefined) updateData.date_of_birth = profileData.date_of_birth;
    if (profileData.phone !== undefined) updateData.phone = profileData.phone;
    if (profileData.address !== undefined) updateData.address = profileData.address;
    if (profileData.bio !== undefined) updateData.bio = profileData.bio;
    if (profileData.profile_picture_url !== undefined) updateData.profile_picture_url = profileData.profile_picture_url;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`);
    }

    return data;
  },

  // Delete user profile
  async deleteProfile(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
  },

  // Calculate age from date of birth
  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  },

  // Upload profile picture to Supabase storage
  async uploadProfilePicture(file: File): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/profile.${fileExt}`;

    // Remove existing profile picture if it exists
    await supabase.storage
      .from('profile-pictures')
      .remove([fileName]);

    // Upload new profile picture
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file, { 
        cacheControl: '3600',
        upsert: true 
      });

    if (error) {
      throw new Error(`Failed to upload profile picture: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // Delete profile picture from storage
  async deleteProfilePicture(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // List all files in user's profile picture folder
    const { data: files, error: listError } = await supabase.storage
      .from('profile-pictures')
      .list(user.id);

    if (listError) {
      throw new Error(`Failed to list profile pictures: ${listError.message}`);
    }

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${user.id}/${file.name}`);
      
      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove(filePaths);

      if (error) {
        throw new Error(`Failed to delete profile pictures: ${error.message}`);
      }
    }
  }
};