import { SERVER_CONFIG } from "#src/config.server"
import type { Route } from "./+types/contentDetails"

const VALID_LIBRARY_IDS = Object.keys(SERVER_CONFIG.content)

export async function loader({ params }: Route.LoaderArgs) {
    const { libraryId, contentId } = params
    if (libraryId === undefined) throw new Error("Missing libraryId")
    if (!VALID_LIBRARY_IDS.includes(libraryId)) throw new Error(`LibraryId must be one of ${VALID_LIBRARY_IDS.join(', ')}`)
    if (contentId === undefined) throw new Error("Missing contentId")

    const library = SERVER_CONFIG.content[libraryId]
    const content = await library?.getById(contentId)

    return new Response(JSON.stringify(content), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
        },
    })
}
