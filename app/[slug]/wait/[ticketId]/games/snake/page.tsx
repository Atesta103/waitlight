import { GameShell } from "@/components/games/shared/GameShell"
import { SnakeGame } from "@/components/games/snake/SnakeGame"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default async function SnakePage({ params }: Props) {
    await params
    return (
        <GameShell title="Snake">
            <SnakeGame />
        </GameShell>
    )
}
