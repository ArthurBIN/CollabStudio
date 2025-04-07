import './MenuItem.scss'

import remixiconUrl from 'remixicon/fonts/remixicon.symbol.svg'
import {Tooltip} from "antd";

export default function MenuItem ({
  icon, title, action, isActive = null,
}: {icon?: string, title?: string, action?: () => void, isActive?: (() => boolean) | null } ) {

    return (
      <>
          <Tooltip placement="bottom" title={title} color={'purple'}>
              <button
                  className={`menu-item ${isActive && isActive() ? ' is-active' : ''}`}
                  onClick={action}
              >
                  <svg className="remix">
                      <use xlinkHref={`${remixiconUrl}#ri-${icon}`}/>
                  </svg>
              </button>
          </Tooltip>

      </>
  )
}
