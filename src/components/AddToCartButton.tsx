import { useBasket } from "src/lib/basket";
import { Button } from "./ui/button";
import { type Product } from "src/lib/products.server";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Link } from "react-router";
import { P } from "./common/typography";

export function AddToCartButton(props: { product: Product }) {
    const basket = useBasket()

    return <>
        <AlertDialog>

            {basket.products.has(props.product)
                ? <div className="flex justify-between items-center bg-green-700/50 p-2 rounded-lg">
                    <P>In your basket!</P>
                    <Link to="/basket"><Button variant='outline'>View</Button></Link>
                </div>
                : <AlertDialogTrigger asChild>
                    <Button className="w-full" onClick={() => basket.addProduct(props.product, { qty: 1 })}>Add to basket</Button>
                </AlertDialogTrigger>

            }


            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{props.product.name} added!</AlertDialogTitle>
                    <AlertDialogDescription>
                        Keep browsing or go to the checkout now?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep browsing</AlertDialogCancel>

                    <AlertDialogAction asChild><Link to={"/basket"}>Go to checkout</Link></AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
}
