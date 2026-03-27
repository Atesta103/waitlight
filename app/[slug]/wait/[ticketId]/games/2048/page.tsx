import { GameShell } from "@/components/games/shared/GameShell"
import { Game2048 } from "@/components/games/2048/Game2048"

type Props = {
    params: Promise<{ slug: string; ticketId: string }>
}

export default async function Game2048Page({ params }: Props) {
    await params
    return (
        <GameShell title="2048">
            <Game2048 />
        </GameShell>
    )
}
