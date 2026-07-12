import { Check, Users, Coins, Star } from "lucide-react";
import { listPools } from "@/lib/data/paluwagan";
import { POOL_STATUS_LABEL } from "@/lib/constants";
import { peso, toNumber } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { CreatePoolForm } from "@/components/paluwagan/create-pool-form";
import { AdvanceCycleButton } from "@/components/paluwagan/advance-cycle-button";

export default async function PaluwaganPage() {
  const pools = await listPools();

  return (
    <div>
      <PageHeader
        title="Paluwagan"
        subtitle="Rotating savings pools — hulog kada cycle, may kukuha ng buo."
        action={<CreatePoolForm />}
      />

      {pools.length === 0 ? (
        <EmptyState
          icon={<Users className="h-8 w-8" />}
          title="Wala pang paluwagan"
          description="Gumawa ng rotating savings pool para sa barkada o pamilya. I-set ang contribution at bilang ng cycle, tapos idagdag ang mga miyembro."
          action={<CreatePoolForm />}
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {pools.map((pool) => {
            const contribution = toNumber(pool.contribution_amount);
            const memberCount = pool.members.length;
            const potPerCycle = contribution * memberCount;
            const isActive = pool.status === "active";
            const nextMember = pool.members.find(
              (m) => m.payout_order === pool.current_cycle,
            );

            return (
              <Card key={pool.id}>
                <CardHeader className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      className="truncate text-lg font-bold text-paper"
                      style={{ fontFamily: "var(--font-crimson), serif" }}
                    >
                      {pool.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted">
                      Cycle {Math.min(pool.current_cycle, pool.cycle_length)} of{" "}
                      {pool.cycle_length}
                    </p>
                  </div>
                  <StatusBadge
                    status={pool.status}
                    label={POOL_STATUS_LABEL[pool.status]}
                  />
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Coins className="h-4 w-4 text-muted" />
                      <span className="text-muted">Contribution</span>
                      <span className="tnum font-semibold text-paper">
                        {peso(contribution)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted" />
                      <span className="text-muted">Pot / cycle</span>
                      <span className="tnum font-semibold text-receivable">
                        {peso(potPerCycle)}
                      </span>
                    </div>
                  </div>

                  <ul className="divide-y divide-border rounded-xl border border-border">
                    {pool.members.map((m) => {
                      const isNext = isActive && m.payout_order === pool.current_cycle;
                      return (
                        <li
                          key={m.id}
                          className={cn(
                            "flex items-center gap-3 px-3.5 py-2.5",
                            isNext && "bg-blood/5",
                          )}
                        >
                          <span
                            className={cn(
                              "tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                              m.has_received_payout
                                ? "border-receivable/40 bg-receivable/10 text-receivable"
                                : isNext
                                  ? "border-blood/50 bg-blood/10 text-blood"
                                  : "border-border-strong text-muted",
                            )}
                          >
                            {m.payout_order}
                          </span>
                          <span
                            className={cn(
                              "min-w-0 flex-1 truncate text-sm",
                              m.has_received_payout ? "text-muted" : "text-paper",
                            )}
                          >
                            {m.member_name}
                          </span>
                          {isNext ? (
                            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-blood">
                              <Star className="h-3.5 w-3.5" />
                              Next payout
                            </span>
                          ) : null}
                          {m.has_received_payout ? (
                            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-receivable">
                              <Check className="h-3.5 w-3.5" />
                              Paid
                            </span>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>

                  {isActive ? (
                    <div className="flex justify-end">
                      <AdvanceCycleButton
                        poolId={pool.id}
                        nextMemberName={nextMember?.member_name}
                      />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
