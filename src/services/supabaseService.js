import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lthyxlwppzscnxrrmtcu.supabase.co";
const supabaseKey = "sb_publishable_1Ir3hfeSEZwDySIZNn1mtA_PQjs8lfK";
const supabase = createClient(supabaseUrl, supabaseKey);

// Fonctions d'authentification
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data?.user, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session, error };
};

// Fonctions de gestion des flashcards
export const fetchAllFlashcards = async () => {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user) {
    throw new Error("Utilisateur non authentifié");
  }

  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", session.session.user.id);

  if (error) throw error;
  return data;
};

export const createFlashcard = async (flashcard) => {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user) {
    throw new Error("Utilisateur non authentifié ! ");
  }

  const flashcardWithUserId = {
    ...flashcard,
    user_id: session.session.user.id,
  };

  const { data, error, status } = await supabase
    .from("flashcards")
    .insert([flashcardWithUserId]);

  return { data, error, status };
};

export const updateFlashcard = async (id, updates) => {
  const { data: session } = await supabase.auth.getSession();

  if (!session?.session?.user) {
    throw new Error("Utilisateur non authentifié");
  }

  const { data, error } = await supabase
    .from("flashcards")
    .update(updates)
    .eq("id", id)
    .eq("user_id", session.session.user.id);

  return { data, error };
};

export default supabase;
