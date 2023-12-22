import { CSSProperties, useRef, useState } from 'react'
import styles from './styles/horizontalScrollList.module.scss'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

const SCROLL_STEP_SIZE = 200 as const

const HorizontalScrollList = ({ children }: { children: any}) => {

    const scrollRef = useRef<HTMLDivElement>(null)
    const [showLeft, setShowLeft] = useState(false)
    const [showRight, setShowRight] = useState(true)

    const scrollHandler = () => {
        if (scrollRef.current) {
            const scrollPosition = scrollRef.current.scrollLeft
            const maxScrollPosition = scrollRef.current.scrollWidth - scrollRef.current.clientWidth

            setShowLeft(scrollPosition > 0)
            setShowRight(scrollPosition < maxScrollPosition)
            
            scrollRef.current.scrollLeft
        }
    }

    const scrollToLeft = () => {
        if (scrollRef.current) {
            const scrollPosition = scrollRef.current.scrollLeft
            scrollRef.current.scrollTo({
                left: scrollPosition + SCROLL_STEP_SIZE,
                behavior: 'smooth'
            })
        }
    }

    const scrollToRight = () => {
        if (scrollRef.current) {
            const scrollPosition = scrollRef.current.scrollLeft
            scrollRef.current.scrollTo({
                left: scrollPosition - SCROLL_STEP_SIZE,
                behavior: 'smooth'
            })
        }
    }

    const buttonConditionalStyles = (show: boolean) => ({
        opacity: show ? 100 : 0,
        pointerEvents: show ? 'all' : 'none'
    }) as CSSProperties

    const gradientConditionalStyles = (show: boolean) => ({
        opacity: show ? 100 : 0,
        pointerEvents: 'none'
    }) as CSSProperties

    return (
        <div style={{ position: 'relative'}}>
            
            {/* Left button */}
            <div 
                onClick={scrollToRight} className={'dark:bg-ocean/50 bg-gray-400/50 hover:bg-air/50 backdrop-blur-md ' + styles.scrollButtonLeft } 
                style={buttonConditionalStyles(showLeft)}
            >
                <FaArrowLeft/>
            </div>
            <div 
                className={'bg-gradient-to-r dark:from-gray-900 from-gray-300 transition-opacity ' + styles.scrollGradientLeft} 
                style={gradientConditionalStyles(showLeft)}
            />

            {/* Right button */}
            <div 
                onClick={scrollToLeft} className={'dark:bg-ocean/50 bg-gray-400/50 hover:bg-air/50 backdrop-blur-md ' + styles.scrollButtonRight} 
                style={buttonConditionalStyles(showRight)}
            >
                <FaArrowRight/>
            </div>
            <div
                className={'bg-gradient-to-l dark:from-gray-900 from-gray-300 transition-opacity ' + styles.scrollGradientRight} 
                style={gradientConditionalStyles(showRight)}
            />

            {/* Contents */}
            <div 
                ref={scrollRef}
                onScroll={scrollHandler}
                className={styles.postListContainer}
            >
                {children}
            </div>
        </div>
    )
}

export default HorizontalScrollList
