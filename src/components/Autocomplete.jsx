"use client";
import * as React from "react";
import PropTypes from "prop-types";
import { Autocomplete, TextField } from "@mui/material";
import { VariableSizeList } from "react-window";
import { styled } from "@mui/material/styles";

// ⚡ Styled listbox to fit into Autocomplete
const LISTBOX_PADDING = 8; // px

function renderRow(props) {
  const { data, index, style } = props;
  const item = data[index];

  return React.cloneElement(item, {
    style: {
      ...style,
      top: style.top + LISTBOX_PADDING,
    },
  });
}

const OuterElementContext = React.createContext({});

const OuterElementType = React.forwardRef((props, ref) => {
  const outerProps = React.useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current != null) {
      ref.current.resetAfterIndex(0, true);
    }
  }, [data]);
  return ref;
}

const ListboxComponent = React.forwardRef(function ListboxComponent(
  props,
  ref
) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;
  const itemSize = 36; // height of each row

  const getChildSize = () => itemSize;

  const height =
    itemCount > 8 ? 8 * itemSize : itemData.length * itemSize + 2 * LISTBOX_PADDING;

  const gridRef = useResetCache(itemCount);

  return (
    <div ref={ref}>
      <OuterElementContext.Provider value={other}>
        <VariableSizeList
          itemData={itemData}
          height={height}
          width="100%"
          ref={gridRef}
          outerElementType={OuterElementType}
          innerElementType="ul"
          itemSize={getChildSize}
          overscanCount={5}
          itemCount={itemCount}
        >
          {renderRow}
        </VariableSizeList>
      </OuterElementContext.Provider>
    </div>
  );
});

ListboxComponent.propTypes = {
  children: PropTypes.node,
};

// Styled textfield for autocomplete
const StyledAutocomplete = styled(Autocomplete)(() => ({
  "& .MuiAutocomplete-listbox": {
    padding: 0,
  },
}));

export default function AutocompleteDropDown({ label, options = [], value, onChange, sx, error, helperText }) {
  return (
    <StyledAutocomplete
      disableListWrap
      ListboxComponent={ListboxComponent}
      value={options.find((o) => o.value === value) || null}
      onChange={(_, newValue) => onChange(newValue?.value)}
      options={options}
      getOptionLabel={(option) => option.title}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error}
          helperText={helperText}
        />
      )}
      sx={sx}
    />
  );
}
