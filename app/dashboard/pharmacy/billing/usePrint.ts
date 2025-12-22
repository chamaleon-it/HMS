import React from 'react'

export default function usePrint() {
    const onClick = () => {
        window.print();
    };
    return { onClick };
}
