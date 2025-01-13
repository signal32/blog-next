import { MouseEventHandler, useEffect, useState } from "react";
import { create } from "zustand";

interface ModalStore {
    modals: JSX.Element[],
    pushModal: (modal: JSX.Element) => void,
    popModal: () => void,
}

export const useModalStore = create<ModalStore>()(set => ({
    modals: [],
    pushModal(modal) {
        set({modals: [...this.modals, modal]})
    },
    popModal() {
        this.modals.pop()
        set({modals: [... this.modals]})
    },
}))

const ModalContext = () => {
    const store = useModalStore(    );

    const [rendered, setRendered] = useState(store.modals.length > 0);
    const [visible, setVisible] = useState(rendered);

    useEffect(() => {
        const show = store.modals.length > 0;
        if (show && !rendered) {
            setRendered(true);
            setTimeout(() => setVisible(true), 100);
        }
        else if (!show && rendered) {
            setVisible(false);
            setTimeout(() => setRendered(false), 200);
        }
    }, [store.modals.length])

    useEffect(() => {
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && store.modals.length) store.popModal()
        })
    })

    const handleBackdropClick: MouseEventHandler = (ev) => {
        if (ev.currentTarget.id == 'modalBackdrop') store.popModal()
    }

    const style = [
        `w-full p-3 h-full flex justify-center items-center bg-black transition-all duration-200`,
        `${visible? 'bg-opacity-60  backdrop-blur-sm' : 'bg-opacity-0 backdrop-blue-none'}`
    ].join(' ');

    return rendered ? (
        <div className="fixed h-full w-full z-40">
            <div id="modalBackdrop" className={style} onClick={handleBackdropClick} >
                { store.modals.map((modal, i) => (
                    <div key={i} className={`w-full max-w-6xl h-screen transition-all duration-200 ${visible? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} >
                        <div onClick={(e) => e.stopPropagation()} >
                            {modal}
                        </div>
                    </div>
                ))}
            </div>

        </div>
    ) : <div></div>
}

export default ModalContext;
