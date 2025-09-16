import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SlotSelectorProps {
  type: "subject" | "faculty" | "room" | "timeSlot";
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  divisionId?: string;
  dayOfWeek?: number;
  timeSlotId?: string;
  subjectId?: string;
}

const SlotSelector: React.FC<SlotSelectorProps> = ({
  type,
  value,
  onChange,
  placeholder,
  disabled = false,
  divisionId,
  dayOfWeek,
  timeSlotId,
  subjectId,
}) => {
  // Determine the API endpoint based on type
  const getQueryKey = () => {
    switch (type) {
      case "subject":
        return ["/api/subjects"];
      case "faculty":
        return ["/api/faculty"];
      case "room":
        return ["/api/rooms"];
      case "timeSlot":
        return ["/api/slots"];
      default:
        return ["/api/subjects"];
    }
  };

  // For availability checking when all required params are present
  const shouldCheckAvailability = 
    type !== "timeSlot" && divisionId && dayOfWeek && timeSlotId;

  // Build proper URL for availability check
  const buildAvailabilityUrl = () => {
    if (!shouldCheckAvailability) return null;
    
    const params = new URLSearchParams({
      division_id: divisionId,
      day_of_week: dayOfWeek.toString(),
      slot_id: timeSlotId,
    });
    
    if (subjectId) {
      params.append('subject_id', subjectId);
    }
    
    return `/api/timetable/available-slots?${params.toString()}`;
  };

  const availabilityUrl = buildAvailabilityUrl();

  // Fetch base data
  const { data: baseData, isLoading: isLoadingBase, error: baseError } = useQuery({
    queryKey: getQueryKey(),
  });

  // Fetch availability when needed
  const { data: availabilityData } = useQuery({
    queryKey: availabilityUrl ? [availabilityUrl] : ["/api/timetable/available-slots", "disabled"],
    enabled: !!availabilityUrl,
  });

  const isLoading = isLoadingBase;
  const error = baseError;

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load {type} options. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  // Process options based on type and availability
  const getOptions = () => {
    const rawData = (baseData as any)?.data || baseData || [];
    
    if (!shouldCheckAvailability) {
      return rawData;
    }

    // Filter by availability if we have availability data
    if ((availabilityData as any)?.data?.available_combinations) {
      const availableItems = (availabilityData as any).data.available_combinations;
      
      switch (type) {
        case "faculty":
          const availableFacultyIds = new Set(
            availableItems.map((item: any) => item.faculty.id)
          );
          return rawData.filter((faculty: any) => 
            availableFacultyIds.has(faculty.id)
          );
        case "room":
          const availableRoomIds = new Set(
            availableItems.map((item: any) => item.room.id)
          );
          return rawData.filter((room: any) => 
            availableRoomIds.has(room.id)
          );
        case "subject":
          const availableSubjectIds = new Set(
            availableItems.map((item: any) => item.subject?.id).filter(Boolean)
          );
          return rawData.filter((subject: any) => 
            availableSubjectIds.has(subject.id)
          );
        default:
          return rawData;
      }
    }

    return rawData;
  };

  const options = getOptions();

  // Get display text based on type
  const getDisplayText = (item: any) => {
    switch (type) {
      case "subject":
        return `${item.name} (${item.code})`;
      case "faculty":
        return `${item.user?.name || item.name || 'Unknown'} - ${item.designation}`;
      case "room":
        return `${item.name} (${item.type}, Cap: ${item.capacity})`;
      case "timeSlot":
        return `${item.name} (${item.startTime} - ${item.endTime})`;
      default:
        return item.name || item.title || "Unknown";
    }
  };

  const getPlaceholderText = () => {
    if (placeholder) return placeholder;
    
    switch (type) {
      case "subject":
        return "Select a subject...";
      case "faculty":
        return "Select faculty...";
      case "room":
        return "Select a room...";
      case "timeSlot":
        return "Select time slot...";
      default:
        return "Select an option...";
    }
  };

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={getPlaceholderText()} />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground text-center">
              {shouldCheckAvailability && availabilityData 
                ? `No available ${type}s for this slot`
                : `No ${type}s found`
              }
            </div>
          ) : (
            options.map((item: any) => (
              <SelectItem key={item.id} value={item.id}>
                {getDisplayText(item)}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      {shouldCheckAvailability && options.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Showing {options.length} available option{options.length !== 1 ? 's' : ''} 
          for this time slot
        </p>
      )}
    </div>
  );
};

export default SlotSelector;