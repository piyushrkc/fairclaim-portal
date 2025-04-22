// claimsService.js (Supabase Version)
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const generateClaimId = () => {
  return 'FC' + Math.floor(100000 + Math.random() * 900000);
};

export const createClaim = async (claimData, documents = []) => {
    try {
      const claimId = generateClaimId(); // "FC123456"
      const uploadedDocs = [];
  
      for (const file of documents) {
        const path = `claims/${claimId}/${uuidv4()}_${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, file);
        if (uploadError) throw uploadError;
  
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
  
        uploadedDocs.push({
          name: file.name,
          type: file.type,
          size: file.size,
          url: urlData.publicUrl,
          uploadedAt: new Date().toISOString()
        });
      }
  
      const newClaim = {
        id: claimId,  // 👈 this is the fix
        ...claimData,
        documents: uploadedDocs,
        status: 'new',
        submittedAt: new Date().toISOString(),
        priority: 'medium'
      };
  
      const { error } = await supabase.from('claims').insert(newClaim);
      if (error) throw error;
  
      await supabase.from('activityLogs').insert({
        id: uuidv4(),  // ✅ add this line
        claimId,
        timestamp: new Date().toISOString(),
        user: 'System',
        action: 'Claim submitted',
        details: `New claim ${claimId} received from ${claimData.name}`
      });
  
      return { ...newClaim, id: claimId };    } catch (error) {
      console.error('❌ Error creating claim:', error);
      throw error;
    }
  };

export const getClaims = async () => {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .order('submittedAt', { ascending: false });
  if (error) throw error;
  return data;
};

export const getClaimLogs = async (id) => {
  const { data, error } = await supabase
    .from('activityLogs')
    .select('*')
    .eq('claimId', id)
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data;
};

export const updateClaimStatus = async (id, status, user = 'Admin') => {
    const normalizedStatus = status.toLowerCase(); // ✅ Ensure consistent lowercase for comparison and DB
  
    const updates = { status: normalizedStatus };
    if (normalizedStatus === 'resolved') {
      updates.resolvedAt = new Date().toISOString(); // ✅ Fixed conditional
    }
  
    const { data, error } = await supabase
      .from('claims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
  
    await supabase.from('activityLogs').insert({
      id: uuidv4(),
      claimId: id,
      timestamp: new Date().toISOString(),
      user,
      action: 'Status updated',
      details: `Claim status changed to ${normalizedStatus}`
    });
  
    return data;
  };

export const updateClaimAssignee = async (id, assignedTo) => {
  const { data, error } = await supabase
    .from('claims')
    .update({ assignedTo })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  await supabase.from('activityLogs').insert({
    id: uuidv4(), // ✅ added
    claimId: id,
    timestamp: new Date().toISOString(),
    user: 'Admin',
    action: 'Claim assigned',
    details: `Claim assigned to ${assignedTo || 'Unassigned'}`
  });

  return data;
};

export const updateClaimResolution = async (id, resolution) => {
  const { data: claim, error: fetchError } = await supabase
    .from('claims')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from('claims')
    .update({ resolution })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;

  await supabase.from('activityLogs').insert({
    id: uuidv4(), // ✅ added
    claimId: id,
    timestamp: new Date().toISOString(),
    user: claim.assignedTo || 'Admin',
    action: 'Claim resolved',
    details: `Claim resolved with status: ${resolution}`
  });

  return data;
};

export const addNote = async (id, note, user = 'Admin') => {
    const { error } = await supabase.from('activityLogs').insert({
      id: uuidv4(), // ✅ This line is essential
      claimId: id,
      timestamp: new Date().toISOString(),
      user,
      action: 'Note added',
      details: note
    });
    if (error) throw error;
  };

export const uploadDocuments = async (id, files) => {
  const { data: claim, error: fetchError } = await supabase
    .from('claims')
    .select('*')
    .eq('id', id)
    .single();
  if (fetchError) throw fetchError;

  const documents = claim.documents || [];
  for (const file of files) {
    const path = `claims/${id}/${uuidv4()}_${file.name}`;
    const { data, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(path, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
    documents.push({
      name: file.name,
      type: file.type,
      size: file.size,
      url: urlData.publicUrl,
      uploadedAt: new Date().toISOString()
    });
  }

  const { error: updateError } = await supabase
    .from('claims')
    .update({ documents })
    .eq('id', id);
  if (updateError) throw updateError;

  await supabase.from('activityLogs').insert({
    id: uuidv4(), // ✅ added
    claimId: id,
    timestamp: new Date().toISOString(),
    user: claim.assignedTo || 'Admin',
    action: 'Document uploaded',
    details: `${files.length} document(s) uploaded`
  });

  return { id, ...claim, documents };
};

export const requestDocument = async (id, requestedBy = 'Admin', documentType = 'additional documentation') => {
  const { error } = await supabase.from('activityLogs').insert({
    id: uuidv4(), // ✅ added
    claimId: id,
    timestamp: new Date().toISOString(),
    user: requestedBy,
    action: 'Document requested',
    details: `Requested ${documentType} from customer`
  });
  if (error) throw error;
  return { success: true, message: 'Document request logged' };
};