-- Enable the pgvector extension for vector operations
create extension if not exists vector with schema public;

-- Create the knowledge_base table
create table public.knowledge_base (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  answer text not null,
  embedding vector(1536), -- OpenAI embeddings are 1536 dimensions
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.knowledge_base enable row level security;

-- Create a function to match knowledge base entries
create or replace function match_knowledge(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  question text,
  answer text,
  similarity float
)
language sql stable
as $$
  select
    knowledge_base.id,
    knowledge_base.question,
    knowledge_base.answer,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Create indexes for better performance
create index on knowledge_base using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Set up permissions
grant select on public.knowledge_base to anon, authenticated;
grant insert, update, delete on public.knowledge_base to authenticated;

-- Create a trigger to update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_knowledge_base_updated_at
  before update on public.knowledge_base
  for each row
  execute function update_updated_at_column();
