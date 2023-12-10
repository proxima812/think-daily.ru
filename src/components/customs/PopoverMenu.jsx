import { Popover, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Fragment, useState } from "react";
import { solutions } from '~/data/solutions';
import { usePopper } from "react-popper";
import AA from '../svg/AA'
import AS from '../svg/SA'
import AN from '../svg/NA'
import AlAnon from '../svg/CODA'
import Other from '../svg/Other'

const colorBgButton = "bg-accent";

function renderName(name) {
  if (name.includes('АА')) {
    return (
      <span className="flex gap-1 items-center">
        <AA />
        {name}
      </span>
    )
  } else if (name.includes('АН')) {
    return (
      <span className="flex gap-1 items-center">
        <AN />
        {name}
      </span>
    )
  } else if (name.includes('АС')) {
    return (
      <span className="flex gap-1 items-center">
        <AS />
        {name}
      </span>
    )
  } else if (name.includes('Ал-Анон') || name.includes('освобождения')) {
    return (
      <span className="flex gap-1 items-center">
        <AlAnon />
        {name}
      </span>
    )
  } else if (name.includes('путь')) {
    return (
      <span className="flex gap-1 items-center">
        <Other />
        {name}
      </span>
    )
  } else if (name.includes('Сексоголики')) {
    return (
      <span className="flex gap-1 items-center">
        <AS />
        {name}
      </span>
    )
  }
  return name
}

export default function PopoverMenu() {
 let [referenceElement, setReferenceElement] = useState();
 let [popperElement, setPopperElement] = useState();
 let { styles, attributes } = usePopper(referenceElement, popperElement);

 //  const currentUrl =
 //   window.location.url === window.location.pathname ? "bg-blue-500" : "";
 //  console.log(currentUrl);

 return (
   <div className="z-40 order-2">
     <Popover className="relative">
       {({ open }) => (
         <>
           <Popover.Button
             ref={setReferenceElement}
             className={`
                ${open ? 'text-white' : 'text-white'}
                group inline-flex text-sm focus:outline-none md:text-[16px] items-center select-none font-medium py-2 px-3 rounded-lg ${colorBgButton}`}
           >
             <span>Другие ежедневники ({solutions.length})</span>
             <ChevronDownIcon
               className={`${open ? 'rotate-180 transform' : 'text-opacity-70'}
                  ml-1 h-5 w-5 text-white" transition duration-150 ease-in-out group-hover:text-opacity-80`}
               aria-hidden="true"
             />
           </Popover.Button>
           <Transition
             as={Fragment}
             enter="transition ease-out duration-200"
             enterFrom="opacity-0 translate-y-1"
             enterTo="opacity-100 translate-y-0"
             leave="transition ease-in duration-150"
             leaveFrom="opacity-100 translate-y-0"
             leaveTo="opacity-0 translate-y-1"
           >
             <Popover.Panel
               className="absolute left-1/2 z-10 mt-3 w-screen max-w-sm -translate-x-1/2 transform px-4 lg:max-w-3xl"
               ref={setPopperElement}
               style={styles.popper}
               {...attributes.popper}
             >
               <div className="overflow-hidden rounded-lg shadow-md">
                 <div className="relative p-5 bg-white z-50 grid gap-5 lg:grid-cols-2">
                   {solutions.map((item, index) => (
                     <a
                       key={index}
                       href={item.href}
                       className={
                         'flex items-center rounded-lg p-3 hover:bg-accent group'
                       }
                     >
                       <div>
                         <p className="group-hover:text-white text-sm font-medium text-gray-900">
                           {renderName(item.name)}
                         </p>
                         <p className="group-hover:text-white text-sm text-gray-500">
                           {item.description}
                         </p>
                       </div>
                     </a>
                   ))}
                 </div>
               </div>
             </Popover.Panel>
           </Transition>
         </>
       )}
     </Popover>
   </div>
 )
}
