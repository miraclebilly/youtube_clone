import React from 'react'
import { useLocation } from "react-router";



export default function useLocationChange(callback) {
    const location = useLocation()
    const prevLocation = usePrevious(location)

    React.useEffect(() => {
        if(prevLocation?.pathname !== location.pathname){
            callback()
        }
    }, [location, prevLocation, callback])
}

function usePrevious(value) {
    const ref = React.useRef()

    React.useEffect(() => {
        ref.current = value
    })
    return ref.current
}

