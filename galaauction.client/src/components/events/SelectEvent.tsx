import { use, useContext, useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useHttp } from "../../hooks/useHttp";
import EventContext from "../../store/EventContext";
import { ModalContext } from "../../store/ModalContext";
import { parseRequiredInt } from "../../utilities/parseInteger";
import { type GalaEventDto } from "../../dto/GalaEventDto";

type SelectEventProps = {
  formRef: React.RefObject<HTMLFormElement|null>;
  onSubmit: () => void;
};

const SelectEvent: React.FC<SelectEventProps> = ({ formRef, onSubmit }) => {
    const { close } = use(ModalContext);
    const navigate = useNavigate();
    const context = useContext(EventContext);
    const { request, isLoading, error } = useHttp();
    const [ events, setEvents ] = useState<GalaEventDto[]>();
    const [selectedEventId, setSelectedEventId] = useState("0");
    let existingEventId = 0;

    if (context.event && context.event?.galaEventId) {
        existingEventId = context.event.galaEventId;
    }

    useEffect(() => {
        setSelectedEventId(existingEventId > 0 ? String(existingEventId) : "0");
    }, [existingEventId]);

    useEffect(() => {
        const getEvents = async () => {
            const eventData = await request('/api/events','GET');
            setEvents(eventData);
        };
        getEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmitAction = (formData: FormData) => {
        const eventId = parseRequiredInt(formData.get("selectEvent"));
        if (events) {
            const event = events.find((event) => event.galaEventId === eventId);
            context.setEvent(event!);
            close();
            onSubmit();
        }
    };

    const handleManageEvents = () => {
        navigate("/manage-events");
        close();
    };

    const handleChangeEvent = (e: ChangeEvent<HTMLSelectElement>) => {
        setSelectedEventId(e.target.value);
    };

    return (
      <form className="flex flex-row gap-4 items-center" ref={formRef} action={handleSubmitAction}>
        <select
          className="select select-sm select-bordered border-base-content/20 bg-base-200 shadow-sm flex-1"
          name="selectEvent"
                    value={selectedEventId}
                    onChange={handleChangeEvent}
        >
            { !isLoading && events && (
                <option value="0" disabled>Select an event...</option>
            )}
            { !isLoading && events && (events.map((event) => (
                <option key={event.galaEventId} value={event.galaEventId}>{event.eventName}</option>
            )))}
            { isLoading && <>
                <option disabled>Loading events...</option>
            </>}
            { error && (
                <option disabled>Error: {error}</option>
            )}
        </select>
        <button type="button" className="btn btn-outline border-base-content/20 bg-base-200 shadow-sm w-20 flex-none" onClick={handleManageEvents}>
            Manage
        </button>
      </form>
    );
};

export default SelectEvent;