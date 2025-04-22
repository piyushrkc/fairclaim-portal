// src/services/assigneesService.js (Supabase Version)
import { supabase } from './supabaseClient';

// Get all active assignees
export const getAssignees = async () => {
  try {
    const { data, error } = await supabase
      .from('assignees')
      .select('*')
      .eq('active', true);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching assignees:', error);
    throw error;
  }
};

// Add a new assignee
export const addAssignee = async (assigneeData) => {
  try {
    const { data, error } = await supabase
      .from('assignees')
      .insert([{ ...assigneeData, active: true }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding assignee:', error);
    throw error;
  }
};