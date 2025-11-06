'use client';

export const EmptyChatState = () => {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-4 bg-[url('https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?auto=format&fit=crop&w=1600&q=60')] bg-cover bg-center bg-no-repeat p-10 text-center text-white/80">
      <div className="rounded-full border border-white/30 bg-black/30 px-5 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
        WhatsApp Web
      </div>
      <h2 className="text-3xl font-semibold text-white drop-shadow-md">
        Stay connected, securely
      </h2>
      <p className="max-w-md text-sm text-white/80">
        Send and receive messages without keeping your phone online. Use
        WhatsApp on up to four linked devices and one phone at the same time.
      </p>
    </div>
  );
};
