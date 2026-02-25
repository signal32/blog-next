import { SERVER_CONFIG } from "src/config.server"

export async function loader() {
    const content = await Promise.all(
        Object.entries(SERVER_CONFIG.content)
            .map(async ([id, library]) => ({
                id,
                content: (await library.getAll()).map(c => ({
                    ...c,
                    route: `/content/${id}/${c.id}`
                }))
            }))
    )

    return new Response(JSON.stringify(content), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    })
}
