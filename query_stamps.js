import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://oznxvjfmjvuaircepkzz.supabase.co";
const SUPABASE_KEY = "sb_secret_O3BOBoGvs6EoY3xwMSh_JQ_9kds47q5";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { count, error } = await supabase
    .from('benches')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Bench count:', count);
}

run();
