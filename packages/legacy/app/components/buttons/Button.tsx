import React, { forwardRef, useEffect, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

import { Button, ButtonType, ButtonProps } from './Button-api'
import { Buttons } from './styles'

const ButtonImpl: Button = forwardRef(
  (
    { title, buttonType, accessibilityLabel, testID, onPress, disabled = false, children },
    ref: React.LegacyRef<TouchableOpacity>
  ) => {
    const accessible = accessibilityLabel && accessibilityLabel !== '' ? true : false

    const buttonStyles = {
      [ButtonType.Critical]: { color: Buttons.critical, text: Buttons.primaryText },
      [ButtonType.Primary]: { color: Buttons.primary, text: Buttons.primaryText },
      [ButtonType.Secondary]: { color: Buttons.secondary, text: Buttons.secondaryText },
      [ButtonType.ModalCritical]: { color: Buttons.modalCritical, text: Buttons.primaryText },
      [ButtonType.ModalPrimary]: { color: Buttons.modalPrimary, text: Buttons.modalPrimaryText },
      [ButtonType.ModalSecondary]: { color: Buttons.modalSecondary, text: Buttons.modalSecondaryText },
    }
    const [isActive, setIsActive] = useState<boolean>(false)

    function onTap() {
      // eslint-disable-next-line no-console
      console.log('App custom behavior')
      onPress?.()
    }

    useEffect(() => {
      // eslint-disable-next-line no-console
      console.log('I am button from main app')
    }, [])
    return (
      <TouchableOpacity
        onPress={onTap}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={'button'}
        onPressIn={() => setIsActive(!disabled && true)}
        onPressOut={() => setIsActive(false)}
        testID={testID}
        style={[
          buttonStyles[buttonType].color,
          disabled && (buttonType === ButtonType.Primary ? Buttons.primaryDisabled : Buttons.secondaryDisabled),
          isActive && buttonType === ButtonType.Secondary && { backgroundColor: Buttons.primary.backgroundColor },
        ]}
        disabled={disabled}
        activeOpacity={0.7}
        ref={ref}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {children}
          <Text
            style={[
              buttonStyles[buttonType].text,
              disabled &&
                (buttonType === ButtonType.Primary ? Buttons.primaryTextDisabled : Buttons.secondaryTextDisabled),
              isActive && { textDecorationLine: 'underline' },
              isActive && buttonType === ButtonType.Secondary && { color: Buttons.primaryText.color },
            ]}
          >
            {title}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
)
export default ButtonImpl
export { ButtonType, ButtonImpl }
export type { Button, ButtonProps }
