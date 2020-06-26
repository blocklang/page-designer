import { library } from "@fortawesome/fontawesome-svg-core";

import { faArrowAltCircleLeft } from "@fortawesome/free-regular-svg-icons/faArrowAltCircleLeft";
import { faEdit } from "@fortawesome/free-regular-svg-icons/faEdit";
import { faCaretSquareRight } from "@fortawesome/free-regular-svg-icons/faCaretSquareRight";
import { faSave } from "@fortawesome/free-regular-svg-icons/faSave";
import { faCube } from "@fortawesome/free-solid-svg-icons/faCube";
import { faUndo } from "@fortawesome/free-solid-svg-icons/faUndo";
import { faRedo } from "@fortawesome/free-solid-svg-icons/faRedo";
import { faLevelUpAlt } from "@fortawesome/free-solid-svg-icons/faLevelUpAlt";
import { faStepForward } from "@fortawesome/free-solid-svg-icons/faStepForward";
import { faStepBackward } from "@fortawesome/free-solid-svg-icons/faStepBackward";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons/faTrashAlt";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight";
import { faArrowsAlt } from "@fortawesome/free-solid-svg-icons/faArrowsAlt";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons/faArrowUp";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons/faArrowDown";
import { faEdit as faSolidEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons/faCaretRight";
import { faCircle } from "@fortawesome/free-solid-svg-icons/faCircle";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { faSignal } from "@fortawesome/free-solid-svg-icons/faSignal";
import { faWifi } from "@fortawesome/free-solid-svg-icons/faWifi";
import { faBatteryFull } from "@fortawesome/free-solid-svg-icons/faBatteryFull";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons/faEllipsisH";
import { faDotCircle } from "@fortawesome/free-solid-svg-icons/faDotCircle";

export function init(): void {
	library.add(
		faArrowAltCircleLeft,
		faEdit,
		faCaretSquareRight,
		faSave,
		faCube,
		faUndo,
		faRedo,
		faLevelUpAlt,
		faStepForward,
		faStepBackward,
		faTrashAlt,
		faAngleDown,
		faAngleRight,
		faArrowsAlt,
		faPlus,
		faArrowUp,
		faArrowDown,
		faSolidEdit,
		faCaretRight,
		faCircle,
		faTimes,
		faSignal,
		faWifi,
		faBatteryFull,
		faEllipsisH,
		faDotCircle
	);
}
