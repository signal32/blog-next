import { PageWithLayout } from '../components/app/LayoutApp'
import { defineLayout } from '../components/app/BaseLayout'
  
const Error404: PageWithLayout<{}> = () => {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
        </div>
    )
}
  
Error404.layout = defineLayout()

export default Error404