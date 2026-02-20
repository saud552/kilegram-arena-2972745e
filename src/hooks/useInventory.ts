// ============================================
// Inventory Hook — Supabase sync
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

type ItemType = 'skin' | 'weapon' | 'helmet' | 'armor' | 'backpack';

interface InventoryItem {
  id: string;
  item_type: ItemType;
  item_id: string;
  item_name: string;
  is_equipped: boolean;
}

export function useInventory() {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', user.userId);
    if (data) setItems(data as InventoryItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const ownedIds = items.map(i => i.item_id);
  const equippedByType = (type: ItemType) => items.find(i => i.item_type === type && i.is_equipped)?.item_id ?? '';

  const purchase = async (itemId: string, itemName: string, itemType: ItemType) => {
    if (!user) return false;
    const { error } = await supabase.from('inventory').insert({
      user_id: user.userId,
      item_type: itemType,
      item_id: itemId,
      item_name: itemName,
      is_equipped: false,
    });
    if (!error) {
      await fetchInventory();
      return true;
    }
    return false;
  };

  const equip = async (itemId: string, itemType: ItemType) => {
    if (!user) return;
    // Unequip all of same type
    await supabase
      .from('inventory')
      .update({ is_equipped: false })
      .eq('user_id', user.userId)
      .eq('item_type', itemType);
    // Equip this one
    await supabase
      .from('inventory')
      .update({ is_equipped: true })
      .eq('user_id', user.userId)
      .eq('item_id', itemId);
    await fetchInventory();
  };

  return { items, ownedIds, equippedByType, purchase, equip, loading, refetch: fetchInventory };
}
