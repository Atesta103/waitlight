import { GameShell } from "@/components/games/shared/GameShell"
import { FlappyGame } from "@/components/games/flappy/FlappyGame"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default async function FlappyPage({ params }: Props) {
    await params
    return (
        <GameShell title="Flappy Bird">
            <FlappyGame />
        </GameShell>
    )
}
