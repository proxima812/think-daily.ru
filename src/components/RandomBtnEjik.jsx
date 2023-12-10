import { useState } from 'react'

const moths = [
  { moth: 'yanvar', name: 'Январь' },
  { moth: 'fevral', name: 'Февраль' },
  { moth: 'mart', name: 'Март' },
  { moth: 'april', name: 'Апрель' },
  { moth: 'maj', name: 'Май' },
  { moth: 'iyun', name: 'Июнь' },
  { moth: 'iyul', name: 'Июль' },
  { moth: 'avgust', name: 'Август' },
  { moth: 'sentyabr', name: 'Сентябрь' },
  { moth: 'oktyabr', name: 'Октябрь' },
  { moth: 'noyabr', name: 'Ноябрь' },
  { moth: 'dekabr', name: 'Декабрь' },
]

function RandomDiaryLink({ pathName }) {
  const [randomPath, setRandomPath] = useState('')

  const generateRandomDate = (month) => {
    const day = Math.floor(Math.random() * 31) + 1
    return `daily_${String(day).padStart(2, '0')}-${month}`
  }

  const handleOnClick = () => {
    const randomMonthIndex = Math.floor(Math.random() * moths.length)
    const randomMonth = moths[randomMonthIndex].moth
    const randomDate = generateRandomDate(randomMonth)
    const path = `/reflections/${pathName}/${randomDate}`
    setRandomPath(path)
  }

  return (
    <button
      onClick={handleOnClick}
      className="text-white bg-gradient-to-r from-green-400 to-green-500 hover:translate-x-[4px] transition-transform ease-in px-2 py-1 rounded-lg text-sm hover:translate-y-[-2px]"
    >
      <a href={randomPath || '#'}>🎲 ежедневник</a>
    </button>
  )
}

export default RandomDiaryLink
