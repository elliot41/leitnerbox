import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lthyxlwppzscnxrrmtcu.supabase.co";
const supabaseKey = "sb_publishable_1Ir3hfeSEZwDySIZNn1mtA_PQjs8lfK";
const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchAllFlashcards = async () => {
  const { data, error } = await supabase.from("flashcards").select("*");

  if (error) throw error;
  return data;
};

export const createFlashcard = async (flashcard) => {
  const { data, error, status } = await supabase
    .from("flashcards")
    .insert([flashcard]);

  return { data, error, status };
};

export const updateFlashcard = async (id, updates) => {
  const { data, error } = await supabase
    .from("flashcards")
    .update(updates)
    .eq("id", id);

  return { data, error };
};

export default supabase;
