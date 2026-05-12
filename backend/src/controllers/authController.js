import { supabase } from '../database/supabase.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const ensureUserScaffold = async ({ userId, username, fullName }) => {
  const safeUsername = username || `agent_${Math.floor(Math.random() * 10000)}`;

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userId,
        username: safeUsername,
        full_name: fullName || 'New Agent',
        xp: 0,
        level: 1,
      },
      { onConflict: 'user_id' },
    );

  if (profileError) throw profileError;

  const { error: walletError } = await supabase
    .from('wallets')
    .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id' });

  if (walletError) throw walletError;

  const { error: streakError } = await supabase
    .from('streaks')
    .upsert({ user_id: userId, current_streak: 0 }, { onConflict: 'user_id' });

  if (streakError) throw streakError;
};

/**
 * @desc    Get current authenticated user profile
 */
export const getMe = async (req, res, next) => {
  try {
    let { data: profile, error } = await supabase
      .from('profiles')
      .select('*, wallets(*), streaks(*)')
      .eq('user_id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    // If profile is missing (e.g. first time Google login), create it
    if (!profile) {
        const username = req.user.email ? req.user.email.split('@')[0] : `agent_${Math.floor(Math.random() * 10000)}`;
        await ensureUserScaffold({
          userId: req.user.id,
          username,
          fullName: 'New Agent',
        });

        const { data: newProfile, error: refreshError } = await supabase
          .from('profiles')
          .select('*, wallets(*), streaks(*)')
          .eq('user_id', req.user.id)
          .maybeSingle();

        if (refreshError) throw refreshError;
        profile = newProfile;
    }

    res.status(200).json({
      success: true,
      data: {
        ...req.user,
        profile: {
          ...profile,
          role: req.user.role || 'STUDENT',
        },
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Register new user via Supabase
 */
export const register = async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      username: z.string().min(3),
      name: z.string().optional(),
      phone: z.string().optional()
    });
    const { email, password, username, name, phone } = schema.parse(req.body);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: name, phone }
      }
    });

    if (error) throw error;

    if (data.user) {
        await ensureUserScaffold({
          userId: data.user.id,
          username,
          fullName: name,
        });
    }

    res.status(201).json({ success: true, message: 'Registration initiated. Please verify OTP.', data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Login user via Supabase
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Verify OTP
 */
export const verify = async (req, res, next) => {
  try {
    const { email, otp, type = 'signup' } = req.body;
    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type });

    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Logout user
 */
export const logout = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const syncProfile = async (req, res, next) => {
    // Legacy sync logic for webhooks
    res.status(200).json({ success: true });
};
