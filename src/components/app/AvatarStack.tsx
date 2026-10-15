import { Avatar } from "./Avatar"

// handoff/03-components.md: overlap 1/3, 2px ring in the surface colour.
export function AvatarStack({
  people,
  max = 5,
  openSeats = 0,
}: {
  people: { id: string; name: string | null }[];
  max?: number;
  openSeats?: number;
}) {
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;

  return (
    <div className="flex items-center">
      {shown.map((person) => (
        <div key={person.id} className="-ml-2 first:ml-0 rounded-full ring-2 ring-background">
          <Avatar id={person.id} name={person.name} size={32} />
        </div>
      ))}
      {overflow > 0 && (
        <div className="-ml-2 flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background">
          +{overflow}
        </div>
      )}
      {openSeats > 0 &&
        Array.from({ length: Math.min(openSeats, Math.max(0, max - shown.length)) }).map((_, i) => (
          <div
            key={`open-${i}`}
            className="-ml-2 flex size-8 items-center justify-center rounded-full border border-dashed border-current text-muted-foreground ring-2 ring-background"
          />
        ))}
    </div>
  );
}
